output "instance_id" {
  description = "EC2 instance ID."
  value       = aws_instance.k8s_host.id
}

output "public_ip" {
  description = "Public IP address of the EC2 instance."
  value       = aws_instance.k8s_host.public_ip
}

output "ssh_command" {
  description = "Command to SSH into the EC2 instance."
  value       = "ssh -i ../stockapp-key.pem ubuntu@${aws_instance.k8s_host.public_ip}"
}

output "frontend_url" {
  description = "Frontend URL after Kubernetes is configured and the app is deployed."
  value       = "http://${aws_instance.k8s_host.public_ip}:30080"
}

output "backend_url" {
  description = "Backend URL after Kubernetes is configured and the app is deployed."
  value       = "http://${aws_instance.k8s_host.public_ip}:30050"
}
