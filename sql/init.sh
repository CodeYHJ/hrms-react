# #!/bin/sh
# set -euo pipefail

# # 可调的等待参数
# MAX_TRIES=30
# SLEEP=1

# # 连接配置（可以通过 environment 传入）
# HOST="${MYSQL_HOST:-mysql-db}"
# USER="${MYSQL_USER:-root}"
# PASS="${MYSQL_ROOT_PASSWORD:?environment variable MYSQL_ROOT_PASSWORD is required}"

# echo "⏳ Waiting for MySQL at $HOST to become available..."
# i=0
# until mysql -h"$HOST" -u"$USER" -p"$PASS" -e "SELECT 1" >/dev/null 2>&1; do
#   i=$((i+1))
#   if [ "$i" -ge "$MAX_TRIES" ]; then
#     echo "❌ MySQL not ready after $((MAX_TRIES * SLEEP)) seconds" >&2
#     exit 1
#   fi
#   sleep "$SLEEP"
# done

# echo "✅ MySQL is ready. Executing SQL files..."

# # 按字典序执行 /sql 目录下的 sql 文件（确保用前缀控制顺序，比如 00-*.sql, 01-*.sql）
# for f in /sql/*.sql; do
#   [ -f "$f" ] || continue
#   echo "----> executing $f"
#   if ! mysql -h"$HOST" -u"$USER" -p"$PASS" < "$f"; then
#     echo "❌ Error executing $f" >&2
#     exit 1
#   fi
# done

# echo "✅ All SQL files executed successfully."