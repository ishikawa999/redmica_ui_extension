#!/bin/bash

redmica_branch=$1
database=$2

# Replace RedMica code to master branch code
if [$redmica_branch = 'master']; then
  set +e
  rm -rf /usr/src/redmine/* > /dev/null
  rm -rf /usr/src/redmine/.* 2> /dev/null
  wget --no-check-certificate wget --no-check-certificate https://github.com/redmica/redmica/archive/master.tar.gz;
  tar -xf master.tar.gz --strip-components=1
  set -e
fi

cp -r /__w/redmica_ui_extension/redmica_ui_extension /usr/src/redmine/plugins
cp /usr/src/redmine/plugins/redmica_ui_extension/.github/templates/database-$database.yml /usr/src/redmine/config/database.yml
cp /usr/src/redmine/plugins/redmica_ui_extension/.github/templates/application_system_test_case.rb /usr/src/redmine/test/application_system_test_case.rb

# PDFのサムネイル作成テストを成功させるため
sed -i 's/^.*policy.*coder.*none.*PDF.*//' /etc/ImageMagick-6/policy.xml

# DB側のログを表示しないため(additional_environment.rbでログを標準出力に出している)
rm -f /usr/src/redmine/config/additional_environment.rb

apt update
apt install -y build-essential
bundle install --with test
bundle update
bundle exec rake db:create db:migrate RAILS_ENV=test