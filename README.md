# transaction-watch-dog

## create a new migration file, run the following command:
```sh
npx sequelize-cli migration:generate --name <migration_name>
```

## create a new model file, run the following command:
```sh
npx sequelize-cli model:generate --name <model_name> --attributes <attribute_name>:<data_type>
```

## create a new seed file, run the following command:
```sh
npx sequelize-cli seed:generate --name <seed_name>
```

## run all migrations, run the following command:
```sh
npx sequelize-cli db:migrate
```

## undo the last migration, run the following command:
```sh
npx sequelize-cli db:migrate:undo
```

## undo all migrations, run the following command:
```sh
npx sequelize-cli db:migrate:undo:all
```

## run all seed files, run the following command:
```sh
npx sequelize-cli db:seed:all
```

## undo the last seed file, run the following command:
```sh
npx sequelize-cli db:seed:undo
```

## undo all seed files, run the following command:
```sh
npx sequelize-cli db:seed:undo:all
```

Node Version: 22.14.0
tree -I 'node_modules|.git'