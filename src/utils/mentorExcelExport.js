import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const BORDER_LIGHT = { style: 'thin', color: { argb: 'FFE2E8F0' } }

const styleTitleCell = (cell) => {
    cell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }
}

const styleMetaCell = (cell) => {
    cell.font = { size: 11, color: { argb: 'FF0F172A' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
}

const applyHeaderStyle = (row) => {
    row.height = 22
    row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
        cell.border = {
            top: BORDER_LIGHT,
            left: BORDER_LIGHT,
            bottom: BORDER_LIGHT,
            right: BORDER_LIGHT,
        }
    })
}

const applyDataRowStyle = (worksheet, row, rowNumber) => {
    row.eachCell((cell) => {
        cell.border = {
            top: BORDER_LIGHT,
            left: BORDER_LIGHT,
            bottom: BORDER_LIGHT,
            right: BORDER_LIGHT,
        }
        cell.alignment = {
            vertical: 'middle',
            horizontal: typeof cell.value === 'number' ? 'center' : 'left'
        }
    })

    if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
        })
    }

    const lcHardCell = worksheet.getCell(`E${rowNumber}`)
    if ((lcHardCell.value || 0) >= 100) {
        lcHardCell.font = { bold: true, color: { argb: 'FF166534' } }
        lcHardCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }
    }
}

const createSummarySheet = (workbook, rows, meta) => {
    const summary = workbook.addWorksheet('Summary')
    summary.columns = [
        { width: 30 },
        { width: 24 },
        { width: 24 },
        { width: 24 },
    ]

    summary.mergeCells('A1:D1')
    summary.getCell('A1').value = 'Mentor Student Coding Report'
    styleTitleCell(summary.getCell('A1'))
    summary.getRow(1).height = 30

    summary.mergeCells('A2:D2')
    summary.getCell('A2').value = `Mentor: ${meta.mentorName} | Scope: ${meta.departmentScope} | Generated: ${meta.generatedAt}`
    styleMetaCell(summary.getCell('A2'))
    summary.getRow(2).height = 22

    const totalStudents = rows.length
    const avgLeetCodeTotal = totalStudents ? Math.round(rows.reduce((acc, row) => acc + row.leetcodeTotal, 0) / totalStudents) : 0
    const avgGithubRepos = totalStudents ? Math.round(rows.reduce((acc, row) => acc + row.githubPublicRepos, 0) / totalStudents) : 0
    const avgGithubContributions = totalStudents ? Math.round(rows.reduce((acc, row) => acc + row.githubContributions, 0) / totalStudents) : 0

    const metricRows = [
        ['Total Students', totalStudents],
        ['Average LeetCode Solved', avgLeetCodeTotal],
        ['Average GitHub Repos', avgGithubRepos],
        ['Average GitHub Contributions', avgGithubContributions],
    ]

    let startRow = 4
    metricRows.forEach(([label, value], idx) => {
        const rowNumber = startRow + idx
        summary.getCell(`A${rowNumber}`).value = label
        summary.getCell(`A${rowNumber}`).font = { bold: true, color: { argb: 'FF1E293B' } }
        summary.getCell(`B${rowNumber}`).value = value
        summary.getCell(`B${rowNumber}`).alignment = { horizontal: 'center' }

        ;['A', 'B'].forEach((col) => {
            const cell = summary.getCell(`${col}${rowNumber}`)
            cell.border = {
                top: BORDER_LIGHT,
                left: BORDER_LIGHT,
                bottom: BORDER_LIGHT,
                right: BORDER_LIGHT,
            }
            if (idx % 2 === 1) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
            }
        })
    })

    const topStudents = [...rows]
        .sort((a, b) => b.leetcodeTotal - a.leetcodeTotal)
        .slice(0, 5)

    summary.getCell('A10').value = 'Top 5 LeetCode Performers'
    summary.getCell('A10').font = { bold: true, size: 12, color: { argb: 'FF0F172A' } }

    const topHeader = summary.getRow(11)
    topHeader.values = ['Student Name', 'Register Number', 'LeetCode Total', 'GitHub Contributions']
    applyHeaderStyle(topHeader)

    topStudents.forEach((student, idx) => {
        const rowNumber = 12 + idx
        const row = summary.getRow(rowNumber)
        row.values = [student.studentName, student.registerNumber, student.leetcodeTotal, student.githubContributions]
        applyDataRowStyle(summary, row, rowNumber)
    })

    summary.views = [{ state: 'frozen', ySplit: 2 }]
}

const createDetailedSheet = (workbook, rows, meta) => {
    const sheet = workbook.addWorksheet('Detailed Data', {
        properties: { defaultRowHeight: 20 }
    })

    sheet.columns = [
        { header: 'Student Name', key: 'studentName', width: 26 },
        { header: 'Register Number', key: 'registerNumber', width: 20 },
        { header: 'LeetCode Easy', key: 'leetcodeEasy', width: 16 },
        { header: 'LeetCode Medium', key: 'leetcodeMedium', width: 18 },
        { header: 'LeetCode Hard', key: 'leetcodeHard', width: 16 },
        { header: 'GitHub Public Repos', key: 'githubPublicRepos', width: 20 },
        { header: 'GitHub Contributions', key: 'githubContributions', width: 22 },
    ]

    sheet.mergeCells('A1:G1')
    sheet.getCell('A1').value = 'Mentor Student Coding Report'
    styleTitleCell(sheet.getCell('A1'))
    sheet.getRow(1).height = 30

    sheet.mergeCells('A2:G2')
    sheet.getCell('A2').value = `Mentor: ${meta.mentorName} | Scope: ${meta.departmentScope} | Generated: ${meta.generatedAt}`
    styleMetaCell(sheet.getCell('A2'))
    sheet.getRow(2).height = 22

    // Grouped professional header layout:
    // Name/RegNo + LeetCode(Easy/Medium/Hard/Total) + GitHub(Repo/Commit)
    sheet.mergeCells('A3:A4')
    sheet.mergeCells('B3:B4')
    sheet.mergeCells('C3:E3')
    sheet.mergeCells('F3:G3')

    sheet.getCell('A3').value = 'Name'
    sheet.getCell('B3').value = 'Reg No'
    sheet.getCell('C3').value = 'LeetCode'
    sheet.getCell('F3').value = 'GitHub'

    sheet.getCell('C4').value = 'Easy'
    sheet.getCell('D4').value = 'Medium'
    sheet.getCell('E4').value = 'Hard'
    sheet.getCell('F4').value = 'Repo'
    sheet.getCell('G4').value = 'Commit'

    const topHeaderRow = sheet.getRow(3)
    applyHeaderStyle(topHeaderRow)
    const subHeaderRow = sheet.getRow(4)
    applyHeaderStyle(subHeaderRow)
    subHeaderRow.height = 20

    rows.forEach((rowData, idx) => {
        const rowNumber = 5 + idx
        const row = sheet.getRow(rowNumber)
        row.values = {
            studentName: rowData.studentName,
            registerNumber: rowData.registerNumber,
            leetcodeEasy: rowData.leetcodeEasy,
            leetcodeMedium: rowData.leetcodeMedium,
            leetcodeHard: rowData.leetcodeHard,
            githubPublicRepos: rowData.githubPublicRepos,
            githubContributions: rowData.githubContributions,
        }
        applyDataRowStyle(sheet, row, rowNumber)
    })

    sheet.autoFilter = { from: 'A4', to: 'G4' }
    sheet.views = [{ state: 'frozen', ySplit: 4 }]
}

const collectCodingRows = async (students, fetchCodingData) => {
    const rows = await Promise.all(
        students.map(async (student) => {
            let codingData = null
            try {
                codingData = await fetchCodingData(student.id)
            } catch (error) {
                console.log(`Unable to fetch coding data for ${student.fullName || student.id}:`, error.message)
            }

            const leetcode = codingData?.leetcode || {}
            const github = codingData?.github || {}

            return {
                studentName: student.fullName || 'N/A',
                registerNumber: student.rollNumber || 'N/A',
                leetcodeUsername: student.codingProfiles?.leetcode || 'N/A',
                leetcodeEasy: leetcode.easySolved ?? 0,
                leetcodeMedium: leetcode.mediumSolved ?? 0,
                leetcodeHard: leetcode.hardSolved ?? 0,
                leetcodeTotal: leetcode.totalSolved ?? 0,
                githubUsername: student.codingProfiles?.github || 'N/A',
                githubPublicRepos: github.publicRepos ?? 0,
                githubFollowers: github.followers ?? 0,
                githubContributions: github.contributions ?? github.totalCommits ?? 0,
            }
        })
    )

    return rows.sort((a, b) => a.studentName.localeCompare(b.studentName))
}

export const exportMentorStudentCodingReport = async ({ students, mentorName, departmentScope, fetchCodingData }) => {
    const rows = await collectCodingRows(students, fetchCodingData)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'EduGrow Plus'
    workbook.created = new Date()

    const meta = {
        mentorName: mentorName || 'Mentor',
        departmentScope: departmentScope || 'N/A',
        generatedAt: new Date().toLocaleString(),
    }

    createDetailedSheet(workbook, rows, meta)
    createSummarySheet(workbook, rows, meta)

    // Ensure the structured detailed report opens first in Excel.
    workbook.views = [{ activeTab: 0 }]

    const today = new Date().toISOString().slice(0, 10)
    const buffer = await workbook.xlsx.writeBuffer()
    const fileBlob = new Blob(
        [buffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    )
    saveAs(fileBlob, `mentor-student-coding-report-${today}.xlsx`)
}
