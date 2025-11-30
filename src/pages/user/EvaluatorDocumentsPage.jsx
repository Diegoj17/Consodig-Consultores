import React from 'react'
import { FaFileUpload } from 'react-icons/fa'
import EvaluatorDocumentsUpload from '../../components/management/project/evaluador/EvaluatorDocumentsUpload'
import '../../styles/pages/user/EvaluatorDocumentsPage.css'

const EvaluatorDocumentsPage = () => {
  return (
    <div className="evaluator-documents-main-page">
      <div className="evaluator-documents-layout">
        <div className="evaluator-documents-main-content">
          <div className="evaluator-documents-container">
            <div className="evaluator-documents-wrapper">
              {/* Header específico de la página */}
              
              {/* Contenido principal */}
              <div className="evaluator-documents-content">
                <EvaluatorDocumentsUpload />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluatorDocumentsPage