terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3"
}

resource "aws_lightsail_key_pair" "merba3_lightsail_key" {
  name = "merba3-key"
}

resource "aws_lightsail_instance" "merba3_lightsail_instance" {
  name              = "merba3"
  availability_zone = "eu-west-3a"
  blueprint_id      = "ubuntu_24_04"
  bundle_id         = "small_3_0"
  key_pair_name     = aws_lightsail_key_pair.merba3_lightsail_key.name

  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file("${path.module}/merba3-key.pem")
      host        = self.public_ip_address
    }
    inline = [
      "sudo apt update",
      "sudo apt upgrade -y",

      # Install Docker
      "sudo apt install apt-transport-https ca-certificates curl software-properties-common -y",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -",
      "sudo add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\"",
      "sudo apt update",
      "sudo apt install docker-ce -y",

      # Make docker run without sudo
      "sudo usermod -aG docker $USER",

      # Generate dhparam 2048 bits
      "sudo mkdir -p ~/dhparam",
      "sudo openssl dhparam -out ~/dhparam/dhparam.pem 2048",
    ]
  }
}

resource "aws_lightsail_instance_public_ports" "merba3_lightsail_ports" {
  instance_name = aws_lightsail_instance.merba3_lightsail_instance.name

  port_info {
    protocol = "tcp"
    from_port = 443
    to_port   = 443
  }
  port_info {
    protocol = "tcp"
    from_port = 80
    to_port   = 80
  }
  port_info {
    protocol = "tcp"
    from_port = 22
    to_port   = 22
  }
}

# Create a static IP
resource "aws_lightsail_static_ip" "merba3_static_ip" {
  name = "merba3-static-ip"
}

# Attach the static IP to the Lightsail instance
resource "aws_lightsail_static_ip_attachment" "merba3_static_ip_attachment" {
  static_ip_name = aws_lightsail_static_ip.merba3_static_ip.name
  instance_name  = aws_lightsail_instance.merba3_lightsail_instance.name
}

# Output the static IP address
output "lightsail_static_ip" {
  value = aws_lightsail_static_ip.merba3_static_ip.ip_address
}

output "lightsail_key_pair_private_key" {
  value     = aws_lightsail_key_pair.merba3_lightsail_key.private_key
  sensitive = true
}

resource "local_file" "lightsail_private_key_file" {
  filename      = "${path.module}/merba3-key.pem"
  content       = aws_lightsail_key_pair.merba3_lightsail_key.private_key
  file_permission = "0600"
}