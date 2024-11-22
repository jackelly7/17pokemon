#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d pokemon1-7.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email jackell2@byu.edu