pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'fatymbengue/gestion-commande-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"

        // SonarQube (optionnel - analyse du JS)
        SONAR_PROJECT_KEY = 'gestion-commande-frontend'
        SONAR_HOST_URL = 'http://192.168.1.6:9000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint JavaScript') {
            steps {
                script {
                    // Installation ESLint si nécessaire
                    sh '''
                        npm init -y
                        npm install eslint --save-dev
                        npx eslint js/ --ext .js || true
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        npx sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=**/node_modules/**,**/*.test.js \
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
                    sh """
                        docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} ${DOCKER_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-credentials',
                        usernameVariable: 'USER',
                        passwordVariable: 'PASS'
                    )]) {
                        sh """
                            echo \$PASS | docker login -u \$USER --password-stdin
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