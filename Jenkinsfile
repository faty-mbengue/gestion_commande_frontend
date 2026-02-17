pipeline {
    agent { label 'agent-windows' }

    environment {
        DOCKER_IMAGE_NAME = 'fatymbengue/gestion-commande-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"

        // Variables SonarQube
        SONAR_PROJECT_KEY = 'gestion-commande-frontend'
        SONAR_HOST_URL = 'http://'http://192.168.1.5:9000'  // À ajuster si IP change
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat """
                        npx sonar-scanner ^
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} ^
                        -Dsonar.host.url=${SONAR_HOST_URL} ^
                        -Dsonar.token=%SONAR_AUTH_TOKEN% ^
                        -Dsonar.sources=. ^
                        -Dsonar.exclusions=**/node_modules/**,**/*.test.js ^
                        -Dsonar.javascript.file.suffixes=.js
                    """
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
                script {
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
            ✅ PIPELINE COMPLET RÉUSSI !
            Image: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
            SonarQube: ${SONAR_HOST_URL}/dashboard?id=${SONAR_PROJECT_KEY}
            """
        }
        failure {
            echo "❌ Pipeline échoué - Vérifie les logs"
        }
    }
}