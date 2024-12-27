module.exports = {
  apps: [{
    name: 'rover-controller-dev',
    script: 'index.js',
    interpreter: './node_modules/.bin/babel-node',
    watch: true,
    env: {
      "DEBUG": "app:*",
      "NODE_ENV": "development"
    },
    // Optional: Configure error logs
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    // Optional: Configure time format for logs
    time: true
  }]
} 