#!/usr/bin/env sh

pushed_tags=$(git push --dry-run --porcelain | grep '^refs/tags/' | awk '{print $2}')

if [ -n "$pushed_tags" ]; then
    echo "Before creating a tag, please confirm if you have completed the update of the backend API version."

    echo "Have you completed the backend API version update? (y/n): \c"
    read -r answer

    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        echo "Please complete the backend API version update before creating a tag."
        exit 1
    fi
fi

exit 0
