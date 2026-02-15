pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'fatymbengue/gestion-commande-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        SONAR_PROJECT_KEY = 'gestion-commande-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint JavaScript') {
            steps {
                bat '''
                    npm install
                    npx eslint js/ --ext .js || exit 0
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '''
                        npx sonar-scanner ^
                        -Dsonar.projectKey=gestion-commande-frontend ^
                        -Dsonar.sources=. ^
                        -Dsonar.exclusions=**/node_modules/**,**/*.test.js ^
                        -Dsonar.javascript.file.suffixes=.js
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat """
                    docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} ${DOCKER_IMAGE_NAME}:latest
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat """
                        echo %PASS% | docker login -u %USER% --password-stdin
                        docker push ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE_NAME}:latest
                        docker logout
                    """
                }
            }
        }
    }

    post {
        success {
            echo """
            ✅ FRONTEND PIPELINE SUCCESS!
            Image: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
            URL: http://localhost:80
            """
        }
        failure {
            echo "❌ Frontend pipeline failed."
        }
    }
}
