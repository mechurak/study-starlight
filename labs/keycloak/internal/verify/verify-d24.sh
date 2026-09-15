#!/bin/sh
set -eu
# Historical backup verification.
umask 077

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/../.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/d24
backup_file=$verification_directory/keycloak.dump
restore_container=keycloak-lab-d24-restore
restore_volume=keycloak-lab-d24-restore
password_file=$state_directory/secrets/keycloak-db-password
created_container=false
created_volume=false

cleanup() {
  if [ "$created_container" = true ]; then
    docker rm --force "$restore_container" >/dev/null 2>&1 || true
  fi
  if [ "$created_volume" = true ]; then
    docker volume rm "$restore_volume" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT HUP INT TERM

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  [ "$status" = running/healthy ] || { echo "required service is not healthy: $container_name ($status)" >&2; exit 1; }
done
[ -s "$password_file" ] || { echo "required database secret is missing: $password_file" >&2; exit 1; }
if docker container inspect "$restore_container" >/dev/null 2>&1; then
  echo "refusing to replace pre-existing container: $restore_container" >&2
  exit 1
fi
if docker volume inspect "$restore_volume" >/dev/null 2>&1; then
  echo "refusing to replace pre-existing volume: $restore_volume" >&2
  exit 1
fi

mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"
find "$verification_directory" -maxdepth 1 -type f -delete

postgres_image=$(docker inspect keycloak-lab-postgres --format '{{.Config.Image}}')
case $postgres_image in
  postgres:18.6-bookworm@sha256:*) ;;
  *) echo "unexpected live PostgreSQL image: $postgres_image" >&2; exit 1 ;;
esac

docker exec keycloak-lab-postgres sh -ec '
  export PGPASSWORD=$(cat /run/secrets/keycloak_db_password)
  exec pg_dump --username=keycloak --dbname=keycloak --format=custom --no-owner --no-privileges
' >"$backup_file"
[ -s "$backup_file" ] || { echo 'pg_dump produced an empty backup' >&2; exit 1; }
docker run --rm --network none --pull never \
  --mount "type=bind,src=$verification_directory,dst=/backup,readonly" \
  --entrypoint pg_restore "$postgres_image" --list /backup/keycloak.dump \
  >"$verification_directory/archive-list.txt"
grep -q 'TABLE DATA public realm ' "$verification_directory/archive-list.txt"

docker volume create \
  --label com.docker.compose.project=keycloak-lab \
  --label dev.study-starlight.task=d24-restore \
  "$restore_volume" >"$verification_directory/restore-volume.txt"
created_volume=true
docker run --detach --pull never --network none \
  --name "$restore_container" \
  --label com.docker.compose.project=keycloak-lab \
  --label dev.study-starlight.task=d24-restore \
  --env POSTGRES_DB=keycloak \
  --env POSTGRES_USER=keycloak \
  --env POSTGRES_PASSWORD_FILE=/run/secrets/keycloak_db_password \
  --mount "type=volume,src=$restore_volume,dst=/var/lib/postgresql" \
  --mount "type=bind,src=$password_file,dst=/run/secrets/keycloak_db_password,readonly" \
  --mount "type=bind,src=$verification_directory,dst=/backup,readonly" \
  "$postgres_image" >"$verification_directory/restore-container.txt"
created_container=true

attempt=0
until docker exec "$restore_container" pg_isready --username=keycloak --dbname=keycloak >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    docker logs "$restore_container" >&2
    echo 'timed out waiting for isolated restore database' >&2
    exit 1
  fi
  sleep 1
done

docker exec "$restore_container" sh -ec '
  export PGPASSWORD=$(cat /run/secrets/keycloak_db_password)
  exec pg_restore --username=keycloak --dbname=keycloak --no-owner --no-privileges --exit-on-error /backup/keycloak.dump
' >"$verification_directory/restore.txt"

summary_sql="SELECT 'realm=' || COUNT(*) FROM REALM
UNION ALL SELECT 'client=' || COUNT(*) FROM CLIENT
UNION ALL SELECT 'user=' || COUNT(*) FROM USER_ENTITY
ORDER BY 1;"
docker exec keycloak-lab-postgres sh -ec '
  export PGPASSWORD=$(cat /run/secrets/keycloak_db_password)
  exec psql --username=keycloak --dbname=keycloak --tuples-only --no-align --command="$1"
' sh "$summary_sql" >"$verification_directory/source-summary.txt"
docker exec "$restore_container" sh -ec '
  export PGPASSWORD=$(cat /run/secrets/keycloak_db_password)
  exec psql --username=keycloak --dbname=keycloak --tuples-only --no-align --command="$1"
' sh "$summary_sql" >"$verification_directory/restore-summary.txt"
cmp "$verification_directory/source-summary.txt" "$verification_directory/restore-summary.txt"

identity_sql="SELECT R.NAME || '/' || C.CLIENT_ID
FROM CLIENT C JOIN REALM R ON R.ID = C.REALM_ID
WHERE (R.NAME = 'study' AND C.CLIENT_ID IN ('app-a', 'd18-worker'))
   OR (R.NAME = 'd16-upstream' AND C.CLIENT_ID = 'study-broker')
ORDER BY 1;"
docker exec "$restore_container" sh -ec '
  export PGPASSWORD=$(cat /run/secrets/keycloak_db_password)
  exec psql --username=keycloak --dbname=keycloak --tuples-only --no-align --command="$1"
' sh "$identity_sql" >"$verification_directory/restored-identities.txt"
grep -Fx 'd16-upstream/study-broker' "$verification_directory/restored-identities.txt"
grep -Fx 'study/app-a' "$verification_directory/restored-identities.txt"
grep -Fx 'study/d18-worker' "$verification_directory/restored-identities.txt"

backup_bytes=$(wc -c <"$backup_file" | tr -d ' ')
backup_sha256=$(shasum -a 256 "$backup_file" | awk '{print $1}')
printf 'format=pg_dump-custom\nbackup_bytes=%s\nbackup_sha256=%s\nrestore=isolated-postgresql\nsource_restore_counts=equal\nrestored_realms=study,d16-upstream\nrestored_clients=app-a,d18-worker,study-broker\n' \
  "$backup_bytes" "$backup_sha256" >"$verification_directory/result.txt"

cleanup
created_container=false
created_volume=false
if docker container inspect "$restore_container" >/dev/null 2>&1 || docker volume inspect "$restore_volume" >/dev/null 2>&1; then
  echo 'isolated restore resources were not removed' >&2
  exit 1
fi
for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}')
  [ "$status" = running/healthy ] || { echo "service changed during D24: $container_name ($status)" >&2; exit 1; }
done

cat "$verification_directory/result.txt"
printf 'D24 database backup and isolated restore verification passed; evidence: %s\n' "$verification_directory"
