# Academic-Calculator

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A React-based academic calculator designed to help RVCE students compute CIE scores, SEE requirements, final grades, SGPA, and CGPA with ease.

# Academic Calculator (React + Vite)

A clean and responsive React app built with Vite to compute CIE, SEE requirements, grades, SGPA, and CGPA for Physics and Chemistry cycles, tailored for RVCE's academic system.

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Description

This academic calculator is designed for students of RV College of Engineering (RVCE). It provides tools to:
- Finalize CIE scores from quizzes, tests, and ELs.
- Estimate required SEE marks for each subject based on current CIE.
- Predict final grades using CIE and SEE.
- Compute SGPA for Physics and Chemistry cycles.
- Calculate overall CGPA across both cycles.

## Features

- **CIE Finalization** with rounded results.
- **SEE Requirement Estimator** (with grade-level mapping and copy buttons).
- **Grade calculator** using CIE and SEE marks.
- **SGPA/CGPA calculator** using subject-wise grades or direct SGPA entry.
- **Clipboard copy** for all results.
- **Input validation** with error messages for all fields.
- **LocalStorage persistence** - your data is saved automatically.
- **Responsive UI** with Tailwind CSS and Lucide icons.
- **Fast HMR** with Vite for lightning-fast development.

## Tech Stack

- **React 18.3.1** - UI library
- **Vite 6.0.3** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React 0.468.0** - Beautiful icon library
- **ESLint** - Code linting

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) (v16 or higher) and [npm](https://www.npmjs.com/) installed.

2. Clone this repository:
```bash
   git clone https://github.com/VivaanHooda/rvce-grade-calculator
```

3. Navigate to the project directory:
```bash
   cd rvce-grade-calculator
```

4. Install dependencies:
```bash
   npm install
```

5. Start the development server:
```bash
   npm run dev
```

6. Open your browser and visit `http://localhost:5173`

## Usage

- Choose your mode (CIE Finalization, Final Grade, or Final CGPA).
- Select your cycle (Physics or Chemistry).
- Enter relevant scores or grades.
- Copy results instantly with one click.
- Use the SEE Requirements feature to find the minimum SEE marks needed to pass or hit a target grade.

## Deployment

To build for production:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

The build output will be in the `dist` folder, ready to be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-new-feature`
3. Make your changes and commit them: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-new-feature`
5. Open a pull request.

Please follow consistent coding styles and include clear commit messages.

## License

This project is licensed under no License currently

## Disclaimer

⚠️ **This is not an official source.** Creators are not responsible for any discrepancies in calculations. Always verify important academic information with official college sources.

## Contact

If you have questions, suggestions, or want to report bugs, feel free to reach out:

- **Vivaan Hooda**
  - Email: vivaan.hooda@gmail.com  
  - GitHub: [https://github.com/VivaanHooda](https://github.com/VivaanHooda)

Project Link: [https://github.com/VivaanHooda/rvce-grade-calculator](https://github.com/VivaanHooda/rvce-grade-calculator)

---

Made with ❤️ for RVCE students
