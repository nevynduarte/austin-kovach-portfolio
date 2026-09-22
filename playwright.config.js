import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://localhost:4173'},webServer:{command:'npm run dev',url:'http://localhost:4173',reuseExistingServer:true},projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}]});
