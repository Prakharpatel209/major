# PowerShell script to kill process on port 5000
param(
    [int]$Port = 5000
)

Write-Host "Checking port $Port..."

try {
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connection) {
        $processId = $connection.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "Found process $($process.ProcessName) (PID: $processId) on port $Port"
            Stop-Process -Id $processId -Force
            Write-Host "Process killed successfully"
        } else {
            Write-Host "Process not found, but port was in use"
        }
    } else {
        Write-Host "Port $Port is already free"
    }
} catch {
    Write-Host "Port $Port is already free"
}
