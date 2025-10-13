pipeline {
  agent any

  environment {
    DOCKERHUB_CRED       = 'dockerhub'
    DOCKERHUB_USER       = 'mmasabalvi'
    DOCKERHUB_REPO_BACKEND  = "${DOCKERHUB_USER}/backend"
    DOCKERHUB_REPO_FRONTEND = "${DOCKERHUB_USER}/frontend"
    DOCKERHUB_REPO_DB       = "${DOCKERHUB_USER}/database"
    IMAGE_TAG               = "${env.GIT_COMMIT.take(7)}"
    MYSQL_CRED              = credentials('mysql-credentials')
  }

  stages {
    stage('Debug permissions') {
      steps {
        sh '''
          whoami
          id
          ls -l /var/run/docker.sock
        '''
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Backend') {
      steps {
        dir('backend') {
          sh "docker build -t ${DOCKERHUB_REPO_BACKEND}:${IMAGE_TAG} ."
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          sh "docker build -t ${DOCKERHUB_REPO_FRONTEND}:${IMAGE_TAG} ."
        }
      }
    }

    stage('Build Database') {
      steps {
        dir('database') {
          sh "docker build -t ${DOCKERHUB_REPO_DB}:${IMAGE_TAG} ."
        }
      }
    }

    stage('Push Images') {
      steps {
        script {
          docker.withRegistry('', env.DOCKERHUB_CRED) {
            sh "docker push ${DOCKERHUB_REPO_BACKEND}:${IMAGE_TAG}"
            sh "docker push ${DOCKERHUB_REPO_FRONTEND}:${IMAGE_TAG}"
            sh "docker push ${DOCKERHUB_REPO_DB}:${IMAGE_TAG}"
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          sh 'docker-compose down || true'

          // Export MySQL credentials for compose
          // sh """
          //   export MYSQL_ROOT_PASSWORD=${MYSQL_CRED_PSW}
          //   export MYSQL_DATABASE=stockdb
          //   export MYSQL_USER=${MYSQL_CRED_USR}
          //   export MYSQL_PASSWORD=${MYSQL_CRED_PSW}
          // """

                  sh """
          MYSQL_ROOT_PASSWORD=${MYSQL_CRED_PSW} \
          MYSQL_DATABASE=stockdb \
          MYSQL_USER=${MYSQL_CRED_USR} \
          MYSQL_PASSWORD=${MYSQL_CRED_PSW} \
          docker-compose down || true

          MYSQL_ROOT_PASSWORD=${MYSQL_CRED_PSW} \
          MYSQL_DATABASE=stockdb \
          MYSQL_USER=${MYSQL_CRED_USR} \
          MYSQL_PASSWORD=${MYSQL_CRED_PSW} \
          docker-compose up -d --build
        """


          // Pull latest images (optional) and bring up stack
          sh 'docker-compose pull || true'
          sh 'docker-compose up -d --build'
        }
      }
    }

    stage('Verify') {
      steps {
        echo "Verifying the deployment..."
        // Example: curl your backend health endpoint
        // sh "sleep 10 && curl -f http://localhost:5000/health || exit 1"
      }
    }
  }

  post {
    success {
      echo "Success: ${IMAGE_TAG}"
    }
    failure {
      echo "Failure: ${IMAGE_TAG}"
    }
  }
}