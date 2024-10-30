const fs = require('fs')
const https = require('https')
const path = require('path')

const APP_ID = process.env.OPENEXCHANGE_APP_ID
if (!APP_ID) {
    console.error('Error: APP_ID environment variable is not set.')
    process.exit(1)
}

const apiUrl = `https://openexchangerates.org/api/latest.json?app_id=${APP_ID}&base=USD&prettyprint=false&show_alternative=true`
const cwd = process.cwd()
const baseDir = process.env.BASE_DIR || 'data'
const dataDir = process.env.DATA_DIR || 'currencies'

console.log('current working directory:', cwd)
console.log('fetching data from:', apiUrl)

https.get(apiUrl, (res) => {
    let data = ''

    res.on('data', (chunk) => {
        data += chunk
    })
    res.on('end', () => {
        try {
            const response = JSON.parse(data)
            console.log('response:', response)
            // Extract the timestamp and format it as YYYY-MM-DD
            const date = new Date(response.timestamp * 1000)
            const year = date.getUTCFullYear()
            const yearStr = year.toString()
            const month = String(date.getUTCMonth() + 1).padStart(2, '0')
            const day = String(date.getUTCDate()).padStart(2, '0')
            const dateString = `${year}-${month}-${day}`

            const finalDirPath = path.join(cwd, baseDir, dataDir, yearStr)
            if (!fs.existsSync(finalDirPath)) {
                console.log(`creating directory: ${finalDirPath}`)
                fs.mkdirSync(finalDirPath, { recursive: true })
            }

            // read index.html, replace {{ date }} with dateString and save it to index.html
            const indexHtmlPath = path.join(__dirname, 'index.html')
            const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8')
            const updatedIndexHtml = indexHtml.replace(/{{ date }}/g, dateString).replace(/{{ year }}/g, yearStr)
            fs.writeFileSync(path.join(cwd, baseDir, 'index.html'), updatedIndexHtml)
            console.log(`updated index.html with date: ${dateString}`, updatedIndexHtml)

            // write the 'rates' object to the file
            const filePath = path.join(cwd, baseDir, dataDir, yearStr, `${dateString}.json`)
            fs.writeFileSync(filePath, JSON.stringify(response.rates, null, 2))
            console.log(`rates saved to ${filePath}`)
        } catch (error) {
            console.error('error parsing JSON response:', error.message)
            process.exit(1)
        }
    })
}).on('error', (err) => {
    console.error('error fetching data:', err.message)
    process.exit(1)
})