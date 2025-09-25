### Создаем и запускаем контейнеры по конфигурации из docker-compose.yaml

```docker-compose -f .docker/docker-compose.yaml up -d```

### Полная остановка

```docker-compose down```

Описание:

- Останавливает все запущенные контейнеры
- Удаляет контейнеры (но не образы)
- Удаляет созданные сети
- Сохраняет тома с данными (данные БД)

### Остановка контейнера с сохранением данных

```docker-compose -f .docker/docker-compose.yaml down```

Описание:

- База данных останавливается корректно
- Все данные сохраняются в томе .docker/postgres/data/
- При следующем запуске данные будут доступны

### Остановка контейнеры с удалением данных

```docker-compose -f .docker/docker-compose.yaml down -v```

Описание:

- Все то же что и docker-compose down
- Дополнительно удаляет тома с данными (данные БД)

### Временная остановка

```docker-compose stop```

Описание:

- Останавливает контейнеры но не удаляет их
- Можно быстро перезапустить

### Удалить все: контейнеры, образы, тома

```docker-compose -f .docker/compose.yaml down --rmi all --volumes```

--volumes - удаляет именованные тома (данные БД)

--rmi (Remove Images)
--rmi all - удаляет все образы использованные в проекте
--rmi local - удаляет только образы собранные локально

### Удалить только образы проекта

```docker-compose -f .docker/compose.yaml down --rmi all```

### Удалить все неиспользуемые образы

```docker image prune -a```


### Подключиться к БД из консоли

```docker exec -it {DOCKER_CONTAINER_NAME} psql -U {DB_USER} -d {DB_NAME}```