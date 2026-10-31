/**
 * Jenkins CI/CD Pipeline Template for TraceFile Analysis & Static Report Deployment
 * 
 * [Configuration Guide]
 * - GIT_CREDENTIALS_ID: Jenkins Credentials ID for Git checkout (e.g. 'git-credentials-id')
 * - GIT_BASE_URL: Git Server Base URL (e.g. 'https://github.com/your-org' or 'https://gitlab.your-company.com/project')
 * - DEPLOY_DIR: Target web server path to deploy static report files (e.g. '/var/www/html/report')
 */
pipeline {
    agent none

    parameters {
        string(name: 'GIT_BASE_URL', defaultValue: 'https://github.com/nicepig7', description: 'Base URL for target source repositories')
        string(name: 'GIT_CREDENTIALS_ID', defaultValue: 'git-credentials-id', description: 'Jenkins Credentials ID for Git')
        string(name: 'DEPLOY_DIR', defaultValue: '/var/www/html/codereport', description: 'Target directory on web server')
    }

    options {
        skipDefaultCheckout()
    }

    stages {
        stage('1. Checkout & Build') {
            agent { label 'build-node' }
            
            tools {
                nodejs 'node-24' 
            }

            steps {
                cleanWs()
                
                // 1) Checkout Target Repository (Backend: Sample App)
                dir('target-repo') {
                    git url: "${params.GIT_BASE_URL}/sample-backend.git",
                        branch: 'dev',
                        credentialsId: "${params.GIT_CREDENTIALS_ID}"
                    echo '✅ [Backend] Checkout Complete!'
                    sh 'git log -1 --format="  ▶ %h - %s (%cr)"'
                }

                // 2) Checkout Target Vue Repository (Frontend)
                dir('target-vue-repo') {
                    git url: "${params.GIT_BASE_URL}/sample-web.git",
                        branch: 'dev',
                        credentialsId: "${params.GIT_CREDENTIALS_ID}"
                    echo '✅ [Frontend] Checkout Complete!'
                    sh 'git log -1 --format="  ▶ %h - %s (%cr)"'
                }

                // 3) Checkout Target Android Repository (AOS)
                dir('target-aos-repo') {
                    git url: "${params.GIT_BASE_URL}/sample-aos.git",
                        branch: 'main',
                        credentialsId: "${params.GIT_CREDENTIALS_ID}"
                    echo '✅ [AOS] Checkout Complete!'
                    sh 'git log -1 --format="  ▶ %h - %s (%cr)"'
                }

                // 4) Checkout Analyzer Repository (TraceFile)
                dir('analyzer-repo') {
                    git url: "${params.GIT_BASE_URL}/fileTrace.git",
                        branch: 'main',
                        credentialsId: "${params.GIT_CREDENTIALS_ID}"
                    echo '✅ [Analyzer] Checkout Complete!'
                    sh 'git log -1 --format="  ▶ %h - %s (%cr)"'
                }

                // 5) Execute Build (Node.js)
                dir('analyzer-repo') {
                    withEnv([
                        "TARGET_DIR=${WORKSPACE}/target-repo/src",
                        "VUE_TARGET_DIR=${WORKSPACE}/target-vue-repo/src",
                        "AOS_TARGET_DIR=${WORKSPACE}/target-aos-repo"
                    ]) {
                        sh '''
                            echo "📦 [NPM] Installing Dependencies..."
                            npm ci || npm install
                            
                            echo "🚀 [BUILD] Running Analysis and Report Build..."
                            echo "  ▶ Backend Target : $TARGET_DIR"
                            echo "  ▶ Frontend Target: $VUE_TARGET_DIR"
                            echo "  ▶ Android Target : $AOS_TARGET_DIR"
                            npm run build
                            
                            echo "✨ [BUILD] Analysis Build Completed!"
                        '''
                    }
                }

                // 6) Stash the generated report files
                dir('analyzer-repo/report') {
                    stash name: 'report-files', includes: '**/*'
                }
            }
        }

        stage('2. Deploy to Web Server') {
            agent { label 'web-node' }
            steps {
                dir("${params.DEPLOY_DIR}") {
                    unstash 'report-files'
                    echo '🚀 [DEPLOY] Deployment Completed Successfully!'
                    sh 'ls -al'
                }
            }
        }
    }
    
    post {
        always {
            node('build-node') {
                cleanWs()
            }
        }
    }
}
