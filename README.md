# abr-geocoder-web
[日本語 (Japanese)](README.ja.md)

Digital Agency Address-based Registry Geocoder (Web app version)

## Overview

abr-geocoder-web is a web application that can normalize address (address/location) strings.  
With text input, normalized addresses can be displayed in a browser for confirmation.  
With file input, you can download multiple normalized addresses as CSV files.  

## Index.
- [abr-geocoder-web](#abr-geocoder)
  - [index](#index)
  - [documentation](#document)
  - [Environment](#Environment)
  - [Installation](#Installation)
  - [Installation](#Installation)
  - [Usage](#Usage)
    - [Text input](#Textinput)
    - [File input](#Fextinput)
  - [License](#License)

## Documentation
- [About joining this project](docs/CONTRIBUTING.en.md)

-------

## Usage environment

Node: **node.js version 20 or higher** is required.  
Target browsers: Google Chrome, Microsoft Edge.

## How to Running locally

1. clone this repository 
2. Install dependent libraries with `npm ci`. 
3. Create `.env` or `.env.local` file with reference to `.env.example` and set environment variables. 
4. Clone the REST API (*Refer to [reference link]()) 
5. run in development mode `npm run dev
6. start up with `http://localhost:3000/` by default, so access it with a browser

## Usage

### Text input

- Access `/one-line-geocoding`.
- Enter any address in the address input field
- Specify search target and output format, and click "start geocoding" button.
  - Refer to [@digital-go-jp/abr-geocoder](https://github.com/digital-go-jp/abr-geocoder) for search target and output format.
- The geocoding results are displayed with the specified search target and output format.
- Clicking the Copy button copies the displayed format string to the clipboard.

### File input

- Access `/file-geocoding`.
- Prepare a file in the following format
  - Character code: Shift_JIS or UTF-8
  - Newline code: CR, LF, CR+LF
  - Example of input file:
    Example input file: 
    ```
    1-3 Kioi-cho, Chiyoda-ku, Tokyo
    1-6-1 Nagata-cho, Chiyoda-ku, Tokyo
    ```
- Select a file and press the Start Geocoding button.
- The resulting geocoded file will be displayed and can be downloaded by clicking the Save File button.

## License

The MIT License.