pipeline {
  agent any

  environment {
    DOCKERHUB_CRED = 'dockerhub-credentials-id'  // Jenkins credentials ID for DockerHub
    DOCKERHUB_USER = 'mmasabalvi'                 // your DockerHub username
    DOCKERHUB_REPO_BACKEND = "${DOCKERHUB_USER}/backend"
    DOCKERHUB_REPO_FRONTEND = "${DOCKERHUB_USER}/frontend"
    IMAGE_TAG = "${env.GIT_COMMIT.take(7)}"       // first 7 chars of commit hash
  }

  stages {
    stage('Checkout') {
      steps {
        // Pull code from repo
        checkout scm
      }
    }

    stage('Setup') {
      steps {
        echo "Preparing environment"
        // If you need to install dependencies on agent (e.g. docker-compose CLI), do it here
      }
    }

    stage('Build Backend') {
      steps {
        dir('backend') {
          sh 'docker build -t ${DOCKERHUB_REPO_BACKEND}:${IMAGE_TAG} .'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          sh 'docker build -t ${DOCKERHUB_REPO_FRONTEND}:${IMAGE_TAG} .'
        }
      }
    }

    stage('Push Images') {
      steps {
        script {
          docker.withRegistry('', env.DOCKERHUB_CRED) {
            sh "docker push ${DOCKERHUB_REPO_BACKEND}:${IMAGE_TAG}"
            sh "docker push ${DOCKERHUB_REPO_FRONTEND}:${IMAGE_TAG}"
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        // Use docker-compose to deploy, assuming compose file uses those image names
        sh 'docker-compose down || true'
        sh 'docker-compose up -d'
      }
    }

    stage('Verify') {
      steps {
        echo "Health check or smoke test could go here"
        // Example: call your backend health endpoint
        // sh "curl -f http://localhost:5000/health"
      }
    }
  }

  post {
    success {
      echo "Pipeline succeeded: ${IMAGE_TAG}"
    }
    failure {
      echo "Pipeline FAILED"
    }
  }
}
