# Ansible Automation

This directory contains Ansible playbooks and configuration for automated server provisioning and deployment of the SmartCities application.

## Overview

The Ansible playbook automates the installation and configuration of Docker and Docker Compose on Ubuntu servers, preparing them for the SmartCities production deployment.

## Contents

- **`playbook.yaml`**: Main Ansible playbook that installs Docker and related tools
- **`ansible_hosts`**: Inventory file defining target server(s)
- **`vault.yaml`**: Encrypted Ansible Vault containing sensitive credentials (sudo password)

## What the Playbook Does

The playbook performs the following tasks on the target server:

1. **Adds Docker Repository**:
   - Downloads Docker GPG key
   - Adds Docker's official APT repository for Ubuntu Noble (24.04)

2. **Installs Docker Components**:
   - Docker Engine (`docker-ce`)
   - Docker CLI (`docker-ce-cli`)
   - containerd runtime
   - Docker Buildx plugin
   - Docker Compose plugin

3. **Enables Docker Service**:
   - Starts Docker daemon
   - Enables Docker to start on boot

## Prerequisites

### On Your Control Machine (Local)

```bash
# Install Ansible
pip install ansible

# Or on Ubuntu/Debian
sudo apt update
sudo apt install ansible

# Verify installation
ansible --version
```

### On Target Server

- Ubuntu 24.04 LTS (Noble) or compatible
- SSH access with sudo privileges
- Python 3 installed (usually pre-installed on Ubuntu)

## Initial Setup

### 1. Configure Inventory

Edit `ansible_hosts` to specify your server IP and SSH user:

```ini
[all]
YOUR_SERVER_IP ansible_ssh_user=YOUR_SSH_USER ansible_become_pass='{{ become_password }}'
```

Example:
```ini
[all]
192.168.1.100 ansible_ssh_user=ubuntu ansible_become_pass='{{ become_password }}'
```

### 2. Create/Update Vault

The vault stores the sudo password for the remote user. Create or edit it:

```bash
# Create new vault (first time)
ansible-vault create vault.yaml

# Edit existing vault
ansible-vault edit vault.yaml
```

The vault should contain:
```yaml
become_password: YOUR_SUDO_PASSWORD
```

**Important**: Remember the vault password! You'll need it every time you run the playbook.

### 3. Test Connection

Before running the playbook, verify SSH connectivity:

```bash
ansible all -i ansible_hosts -m ping --ask-vault-pass
```

## Running the Playbook

Execute the playbook to provision your server:

```bash
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass
```

You'll be prompted for:
1. **Vault password**: The password you set when creating the vault

The playbook will then:
- Connect to the server via SSH
- Install Docker and all dependencies
- Start and enable the Docker service

### Running with Verbose Output

For debugging or detailed output:

```bash
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass -v   # Verbose
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass -vv  # More verbose
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass -vvv # Very verbose
```

## Workflow Integration

### Typical Deployment Workflow

1. **Provision Server** (this playbook):
   ```bash
   cd ansible
   ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass
   ```

2. **Deploy Application** (manual or via scripts):
   ```bash
   # SSH to the server
   ssh user@server-ip

   # Follow deployment guide
   # See ../DEPLOYMENT.md for full instructions
   ```

### One-Time vs. Repeated Use

- **One-time**: Run this playbook once to set up a new server
- **Idempotent**: Safe to run multiple times (won't break existing installations)
- **Updates**: Re-run if you need to ensure Docker is installed/updated

## Vault Management

### View Vault Contents (without editing)

```bash
ansible-vault view vault.yaml
```

### Change Vault Password

```bash
ansible-vault rekey vault.yaml
```

### Encrypt an Existing File

```bash
ansible-vault encrypt vault.yaml
```

### Decrypt Vault (not recommended for security)

```bash
ansible-vault decrypt vault.yaml
```

## Troubleshooting

### Connection Issues

**Error**: "Failed to connect to the host via ssh"

**Solutions**:
- Verify the server IP in `ansible_hosts`
- Ensure SSH key is configured: `ssh-copy-id user@server-ip`
- Test manual SSH: `ssh user@server-ip`

### Authentication Issues

**Error**: "Incorrect sudo password"

**Solutions**:
- Verify vault password is correct
- Edit vault and check `become_password`: `ansible-vault edit vault.yaml`
- Test sudo on server: `ssh user@server-ip 'echo YOUR_PASSWORD | sudo -S echo "test"'`

### Docker Installation Fails

**Error**: "Unable to locate package docker-ce"

**Solutions**:
- Ensure target is Ubuntu 24.04 (Noble)
- For other Ubuntu versions, update the repo line in `playbook.yaml`
- Check internet connectivity on target server

### Vault Password Issues

**Error**: "Decryption failed"

**Solutions**:
- Ensure you're entering the correct vault password
- If password is lost, recreate the vault: `ansible-vault create vault.yaml`

## Multi-Server Deployment

To deploy to multiple servers, update `ansible_hosts`:

```ini
[production]
server1.example.com ansible_ssh_user=ubuntu ansible_become_pass='{{ become_password }}'
server2.example.com ansible_ssh_user=ubuntu ansible_become_pass='{{ become_password }}'

[staging]
staging.example.com ansible_ssh_user=ubuntu ansible_become_pass='{{ become_password }}'
```

Target specific groups:
```bash
# All servers
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass

# Only production
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass --limit production

# Only staging
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass --limit staging
```

## Security Best Practices

1. **Never commit vault password**: Keep it secure and separate
2. **Never commit decrypted vault.yaml**: Always keep it encrypted
3. **Use SSH keys**: Prefer SSH key authentication over passwords
4. **Limit sudo access**: Use dedicated deployment user with minimal privileges
5. **Rotate passwords**: Periodically update vault password and sudo credentials

## Extending the Playbook

To add more automation tasks (e.g., pulling Docker images, starting containers), add tasks to `playbook.yaml`:

```yaml
- name: Additional deployment tasks
  tasks:
    - name: Create deployment directory
      ansible.builtin.file:
        path: /opt/smartcities
        state: directory
        owner: "{{ ansible_user }}"

    - name: Copy docker-compose file
      ansible.builtin.copy:
        src: ../docker-compose.prod.yml
        dest: /opt/smartcities/docker-compose.yml

    - name: Pull Docker images
      community.docker.docker_compose:
        project_src: /opt/smartcities
        pull: yes
```

## Related Documentation

- **[../DEPLOYMENT.md](../DEPLOYMENT.md)**: Full production deployment guide
- **[../README.md](../README.md)**: Project overview and development setup
- **[Ansible Documentation](https://docs.ansible.com/)**: Official Ansible docs

## Support

For Ansible-related issues:
- Check playbook syntax: `ansible-playbook playbook.yaml --syntax-check`
- Validate inventory: `ansible-inventory -i ansible_hosts --list`
- Test connection: `ansible all -i ansible_hosts -m ping --ask-vault-pass`
