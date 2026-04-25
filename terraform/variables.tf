variable "aws_region" {
  description = "AWS region where the infrastructure will be created."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name used for AWS resource tags."
  type        = string
  default     = "stockapp"
}

variable "instance_type" {
  description = "EC2 instance size for the single-node Kubernetes host."
  type        = string
  default     = "t3.small"
}

variable "availability_zone" {
  description = "Availability Zone for the public subnet and EC2 instance."
  type        = string
  default     = "us-east-1a"
}

variable "key_name" {
  description = "Existing AWS EC2 key pair name used for SSH access."
  type        = string
  default     = "stockapp-key"
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into the EC2 instance."
  type        = string
  default     = "0.0.0.0/0"
}
