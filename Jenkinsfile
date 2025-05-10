pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "registry.example.com"
        DOCKER_CREDENTIALS_ID = "docker-credentials"
        KUBECONFIG_ID = "kubeconfig"
        NAMESPACE = "presence-app"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                    sh 'npm run test'
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh './mvnw clean package -DskipTests'
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit '**/target/surefire-reports/*.xml'
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm run test:ci'
                        }
                    }
                    post {
                        always {
                            junit 'frontend/junit.xml'
                        }
                    }
                }
                
                stage('Selenium Tests') {
                    steps {
                        dir('selenium-tests') {
                            sh 'npm ci'
                            sh 'npm run test'
                        }
                    }
                    post {
                        always {
                            junit 'selenium-tests/reports/*.xml'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    // Build Frontend Docker image
                    docker.build("${DOCKER_REGISTRY}/presence-frontend:${BUILD_NUMBER}", "-f Dockerfile .")
                    
                    // Build Backend Docker image
                    docker.build("${DOCKER_REGISTRY}/presence-backend:${BUILD_NUMBER}", "-f backend/Dockerfile ./backend")
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                        docker.image("${DOCKER_REGISTRY}/presence-frontend:${BUILD_NUMBER}").push()
                        docker.image("${DOCKER_REGISTRY}/presence-backend:${BUILD_NUMBER}").push()
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: "${KUBECONFIG_ID}"]) {
                    sh "envsubst < kubernetes/frontend-deployment.yaml | kubectl apply -f -"
                    sh "kubectl apply -f kubernetes/frontend-service.yaml"
                    sh "envsubst < kubernetes/backend-deployment.yaml | kubectl apply -f -"
                    sh "kubectl apply -f kubernetes/backend-service.yaml"
                    sh "kubectl apply -f kubernetes/ingress.yaml"
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                withKubeConfig([credentialsId: "${KUBECONFIG_ID}"]) {
                    sh "kubectl rollout status deployment/frontend -n ${NAMESPACE}"
                    sh "kubectl rollout status deployment/backend -n ${NAMESPACE}"
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
            slackSend(color: 'good', message: "Deployment successful: ${env.JOB_NAME} ${env.BUILD_NUMBER}")
        }
        failure {
            echo 'Deployment failed!'
            slackSend(color: 'danger', message: "Deployment failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}")
        }
    }
}
