## how to run the project
Before spinning up this project, make sure no other program is running on port 3000 on the host machine.

To run this project:
1. clone the repo
2. go to the root directory (where docker-compose.yml is located)
3. depending on your docker installation, run: 
```docker compose up --build```
or 
```docker-compose up --build```

4. go to ```localhost:3000``` on your host machine to play the game


## running tests
There are three types of tests implemented

### unit tests to test the game logic
to run unit tests:

1. go into the frontend container
```docker exec -it poker_frontend sh```

2. run the tests
```npx jest```

### api tests for the backend
to run api tests:

1. go into the backend container
```docker exec -it poker_backend sh```

2. run the tests
```poetry run pytest```

### e2e test
Running e2e tests from within the docker container requires headless browsers to be installed inside the container, bloating the container and lengthening the build time. Thus the frontend's Dockerfile in the main branch does not install these components. For this reason, e2e tests can be run only after switching the branch to 'e2e_test_enabled'.

To run e2e tests:

1. switch branch
```git switch e2e_test_enabled```

2. spin up the project
```docker compose up --build```

3. get into the frontend container
```docker exec -it poker_frontend sh```

4. run tests
```npx playwright test```