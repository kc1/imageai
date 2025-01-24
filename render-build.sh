 #!/usr/bin/env bash
set -e

# Set the PLAYWRIGHT_BROWSERS_PATH environment variable
# export PLAYWRIGHT_BROWSERS_PATH="/opt/render/project/playwright"
# export PLAYWRIGHT_BROWSERS_PATH="/opt/render/project/playwright/chromium-1155"
# Chromium Headless Shell 133.0.6943.16 (playwright build v1155) downloaded to /opt/render/project/playwright/chromium_headless_shell-1155
export PLAYWRIGHT_BROWSERS_PATH="/opt/render/project/playwright/chromium-1155/chromium-1155/"

npm install                                   
# yarn playwright install chromium
# npx playwright install-deps chromium
npx playwright install

# Store/pull Playwright cache with build cache
if [[ ! -d $PLAYWRIGHT_BROWSERS_PATH ]]; then 
  echo "...Copying Playwright Cache from Build Cache"  
  cp -R $XDG_CACHE_HOME/playwright/ $PLAYWRIGHT_BROWSERS_PATH
else 
  echo "...Storing Playwright Cache in Build Cache" 
  cp -R $PLAYWRIGHT_BROWSERS_PATH $XDG_CACHE_HOME
fi
