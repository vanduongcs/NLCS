Setup

- Step 1: Open 'cmd' and run 'npm install' or 'yarn install' in the root folder to install the 'node_modules' folder.  
- Step 2: Open the 'backend' and 'frontend' folders and do the same to install the 'node_modules' folders.  
- Step 4: Open another cmd in root folder and run "mongod" to run MongoDB Server (please install if you aren't install it).
- Step 3: Go back to the root folder and run 'yarn dev' or 'npm run dev' to start the project.
- Step 5: Use Postman and post the API to the URL: 'http://localhost:2025/api/account/dang-ky' with the information (JSON):
{
    "TenTaiKhoan": "admin",
    "TenHienThi": "Admin",
    "MatKhau": "123456",
    "Loai": "admin",
    "CCCD": "084123456789",
    "SDT": "0812345678"
}
- Step 4: Open browser and go to: http://localhost:5173/