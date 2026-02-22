output "server_public_ip" {
  description = "The public IP address of the OCI ARM instance"
  value       = oci_core_instance.erm_server.public_ip
}

output "instance_id" {
  value = oci_core_instance.erm_server.id
}
