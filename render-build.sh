 #!/usr/bin/env bash
set -e

# Set the PLAYWRIGHT_BROWSERS_PATH environment variable
export PLAYWRIGHT_BROWSERS_PATH="/opt/render/project/playwright"

# npm install                                                               ║
# npx playwright install    
# npx playwright install
yarn playwright install chromium
# Install Playwright browsers

# npm install                                                               ║
# Store/pull Playwright cache with build cache
if [[ ! -d $PLAYWRIGHT_BROWSERS_PATH ]]; then 
  echo "...Copying Playwright Cache from Build Cache"  
  cp -R $XDG_CACHE_HOME/playwright/ $PLAYWRIGHT_BROWSERS_PATH
else 
  echo "...Storing Playwright Cache in Build Cache" 
  cp -R $PLAYWRIGHT_BROWSERS_PATH $XDG_CACHE_HOME
fi
