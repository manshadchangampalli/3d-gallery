pipeline {
    agent any
    environment {
        PROD_DIR = "/Users/ghz/Desktop/jenkins"
    }
    stages {
        stage('Clean up') {
            steps {
                sh 'rm -rf .next'
            }
        }
        stage('Build') {
            steps {
                sh 'pnpm install'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                // 1. Move the new build to your Desktop folder
                sh "rm -rf ${PROD_DIR}/.next ${PROD_DIR}/public"
                sh "cp -r .next ${PROD_DIR}/"
                sh "cp package.json ${PROD_DIR}/" // Also copy package.json if needed
                sh "cp pnpm-lock.yaml ${PROD_DIR}/"
                sh "cp -r public ${PROD_DIR}"

                dir("${PROD_DIR}"){
                   sh "pnpm install"
                }
                // 2. Tell PM2 to refresh the app with the new files
                sh "pm2 reload my-next-app"
                
                echo "Deployment to Desktop Successful!"
            }
        }
    }
}
