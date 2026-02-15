pipeline {
    agent { label 'agent-windows' }

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
                script {
                    // Adaptation pour Windows uniquement (on force agent-windows)
                    bat """
                        docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} ${DOCKER_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: '0b645248-5ff1-4028-9402-f5c77efce425',  // ID existant
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    script {
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
    }

    post {
        success {
            echo """
            ✅ DEPLOYMENT SUCCESS !
            Image: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
            """
        }
        failure {
            echo "❌ Deployment failed."
        }
    }
}