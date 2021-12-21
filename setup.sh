#! /bin/bash

echo "Extracting extensions..."
tar -xzvf extensions.tar.gz -C ~/.vscode-server/ 

echo "Updating system..."
sudo apt-get update

echo "Installing nodejs and npm via nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
export NVM_DIR=$HOME/.nvm; # https://stackoverflow.com/questions/35206723/cant-use-nvm-from-bash-script
source $NVM_DIR/nvm.sh;
nvm install lts/fermium
nvm install-latest-npm

echo "Running npm install in projects..."
cd services/backend
npm i
cd ../mail-service
npm i
cd ../template-service
npm i
cd ../..

echo "Installing docker..."
sudo apt-get -y install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get -y install docker-ce docker-ce-cli containerd.io

echo "Installing docker-compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Adding ubuntu user to docker group..."
sudo usermod -aG docker ubuntu

echo
echo "Setup successful!"

newgrp docker # https://docs.docker.com/engine/install/linux-postinstall/