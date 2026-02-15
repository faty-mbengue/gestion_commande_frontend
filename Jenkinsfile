pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'fatymbengue/gestion-commande-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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
            ✅ DEPLOYMENT SUCCESS !
            Image publiée :
            ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
            ${DOCKER_IMAGE_NAME}:latest
            """
        }
        failure {
            echo "❌ Deployment failed."
        }
    }
}
