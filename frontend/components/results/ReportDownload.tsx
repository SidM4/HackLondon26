'use client'

import { useRef, useCallback } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { jsPDF } from 'jspdf'
import { Download } from 'lucide-react'

export function ReportDownload() {
  const reportRef = useRef<HTMLDivElement>(null)
  const inputs = useAnalysisStore((s) => s.inputs)
  const analyseResult = useAnalysisStore((s) => s.analyseResult)

  const handleDownload = useCallback(async () => {
    if (!reportRef.current || !analyseResult) return
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    let y = margin

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Meridian Planning Report', margin, y)
    y += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Postcode: ${inputs?.postcode ?? '—'}`, margin, y)
    y += 6
    if (inputs?.property_description.property_type) {
      pdf.text(
        `Property: ${inputs.property_description.property_type}, ${inputs.property_description.bedrooms} bed, ${inputs.property_description.bathrooms} bath`,
        margin,
        y
      )
      y += 6
    }
    y += 5

    // Approval probability
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Council Approval Probability', margin, y)
    y += 8
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    const approvalPct = Math.round(analyseResult.approval_probability * 100)
    pdf.text(`${approvalPct}%`, margin, y)
    y += 10

    // Precedents
    if (analyseResult.precedents?.length) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Previous Changes in Your Area', margin, y)
      y += 6
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      analyseResult.precedents.slice(0, 8).forEach((p) => {
        if (y > pageHeight - 30) {
          pdf.addPage()
          y = margin
        }
        pdf.text(`${p.app_id} — ${p.decision} — ${p.title}`, margin, y)
        y += 5
      })
      y += 5
    }

    // Suggested improvements
    if (analyseResult.suggested_improvements?.length) {
      if (y > pageHeight - 40) {
        pdf.addPage()
        y = margin
      }
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Suggested Home Improvements', margin, y)
      y += 8
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      analyseResult.suggested_improvements.forEach((imp) => {
        if (y > pageHeight - 30) {
          pdf.addPage()
          y = margin
        }
        pdf.setFont('helvetica', 'bold')
        pdf.text(imp.work_type_label, margin, y)
        y += 5
        pdf.setFont('helvetica', 'normal')
        pdf.text(imp.description, margin, y)
        y += 5
        pdf.text(
          `Est. cost: £${imp.estimated_cost.toLocaleString()} | Est. value added: £${imp.value_added.toLocaleString()} | Approval: ${Math.round(imp.approval_probability * 100)}%`,
          margin,
          y
        )
        y += 8
      })
    }

    // Footer
    const footerY = pageHeight - 15
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'italic')
    pdf.text(
      'This report is indicative. Data: Ibex / Land Registry. See our methodology and disclaimers online.',
      margin,
      footerY
    )

    pdf.save('meridian-planning-report.pdf')
  }, [inputs, analyseResult])

  if (!analyseResult) return null

  return (
    <div ref={reportRef}>
      <button
        type="button"
        onClick={handleDownload}
        className="group inline-flex items-center gap-3 rounded-xl border-2 border-slate-blue bg-slate-blue px-6 py-3 text-sm font-semibold text-white hover:bg-slate-blue/90 transition-all duration-300 active:scale-[0.965] focus-ring"
        aria-label="Download PDF report"
      >
        <Download className="h-4 w-4" />
        Download Report
        <span className="text-xs text-white/50 font-normal">PDF</span>
      </button>
    </div>
  )
}
