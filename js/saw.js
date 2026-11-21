/**
 * SIMPLE ADDITIVE WEIGHTING (SAW) ENGINE
 * Modul komputasi matematis untuk SPK Rekrutmen Toko Komputer BOSNIALine
 */

const SAWEngine = {
  /**
   * Menghitung seluruh tahapan metode SAW
   * @param {Array} criteriaList - Daftar kriteria [{id, code, name, type, weight}]
   * @param {Array} applicantList - Daftar pelamar [{id, name, ...}]
   * @param {Object} assessments - Nilai matriks { [applicantId]: { C1: 5, C2: 4, ... } }
   * @param {Number} quota - Kuota penerimaan karyawan
   * @param {Object} manualDecisions - Override manual status/catatan
   */
  calculate(criteriaList, applicantList, assessments, quota = 3, manualDecisions = {}) {
    // 1. Filter pelamar yang memiliki data penilaian
    const evaluatedApplicants = applicantList.filter(app => {
      const score = assessments[app.id];
      if (!score) return false;
      // Periksa apakah minimal salah satu kriteria sudah dinilai
      return criteriaList.some(c => score[c.code] !== undefined && score[c.code] !== null);
    });

    if (evaluatedApplicants.length === 0) {
      return {
        hasData: false,
        message: "Belum ada pelamar yang dinilai. Silakan masukkan nilai pada menu Penilaian Pelamar.",
        criteriaList,
        evaluatedApplicants: [],
        decisionMatrix: [],
        extremes: {},
        normalizedMatrix: [],
        weightedMatrix: [],
        rankings: []
      };
    }

    // 2. Normalisasi Bobot Kriteria (memastikan total bobot = 1)
    const rawTotalWeight = criteriaList.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
    const normalizedCriteria = criteriaList.map(c => ({
      ...c,
      normalizedWeight: rawTotalWeight > 0 ? (parseFloat(c.weight || 0) / rawTotalWeight) : 0
    }));

    // 3. Membangun Matriks Keputusan (X)
    const decisionMatrix = evaluatedApplicants.map(app => {
      const row = {
        applicantId: app.id,
        applicantName: app.name,
        position: app.position,
        scores: {}
      };
      normalizedCriteria.forEach(c => {
        const val = assessments[app.id] && assessments[app.id][c.code] !== undefined
          ? parseFloat(assessments[app.id][c.code])
          : 1; // default fallback minimum
        row.scores[c.code] = val;
      });
      return row;
    });

    // 4. Menentukan Nilai Max (untuk Benefit) dan Min (untuk Cost) pada tiap kriteria
    const extremes = {};
    normalizedCriteria.forEach(c => {
      const columnValues = decisionMatrix.map(row => row.scores[c.code]);
      const maxVal = Math.max(...columnValues);
      const minVal = Math.min(...columnValues);
      extremes[c.code] = {
        type: c.type.toLowerCase(),
        max: maxVal,
        min: minVal,
        targetExtremum: c.type.toLowerCase() === 'benefit' ? maxVal : minVal
      };
    });

    // 5. Menghitung Matriks Ternormalisasi (R)
    // Benefit: r_ij = x_ij / Max(x_j)
    // Cost:    r_ij = Min(x_j) / x_ij
    const normalizedMatrix = decisionMatrix.map(row => {
      const normRow = {
        applicantId: row.applicantId,
        applicantName: row.applicantName,
        position: row.position,
        rawScores: row.scores,
        normalizedScores: {},
        steps: {}
      };

      normalizedCriteria.forEach(c => {
        const x_ij = row.scores[c.code];
        const ext = extremes[c.code];
        let r_ij = 0;
        let stepText = "";

        if (c.type.toLowerCase() === 'benefit') {
          // Benefit: x_ij / Max
          r_ij = ext.max > 0 ? (x_ij / ext.max) : 0;
          stepText = `${x_ij} / ${ext.max} = ${r_ij.toFixed(4)}`;
        } else {
          // Cost: Min / x_ij
          r_ij = x_ij > 0 ? (ext.min / x_ij) : 0;
          stepText = `${ext.min} / ${x_ij} = ${r_ij.toFixed(4)}`;
        }

        normRow.normalizedScores[c.code] = r_ij;
        normRow.steps[c.code] = stepText;
      });

      return normRow;
    });

    // 6. Menghitung Nilai Preferensi (V_i) = Sum(w_j * r_ij)
    const weightedMatrix = normalizedMatrix.map(normRow => {
      let v_i = 0;
      const contributions = {};
      const formulaParts = [];

      normalizedCriteria.forEach(c => {
        const r_ij = normRow.normalizedScores[c.code];
        const w_j = c.normalizedWeight;
        const weightedScore = w_j * r_ij;
        contributions[c.code] = weightedScore;
        v_i += weightedScore;

        formulaParts.push(`(${w_j.toFixed(2)} × ${r_ij.toFixed(4)})`);
      });

      return {
        applicantId: normRow.applicantId,
        applicantName: normRow.applicantName,
        position: normRow.position,
        normalizedScores: normRow.normalizedScores,
        contributions,
        totalScore: v_i,
        formulaString: formulaParts.join(' + ') + ` = ${v_i.toFixed(4)}`
      };
    });

    // 7. Perangkingan (Sorting Descending berdasarkan Nilai V_i)
    const sortedRankings = [...weightedMatrix].sort((a, b) => b.totalScore - a.totalScore);

    // 8. Menetapkan Status Hasil Seleksi (Lolos, Cadangan, Tidak Lolos)
    const rankings = sortedRankings.map((item, index) => {
      const rank = index + 1;
      const manual = manualDecisions[item.applicantId];
      let autoStatus = "Tidak Lolos";
      let statusBadgeClass = "badge-danger";

      if (rank <= quota) {
        autoStatus = "Lolos / Diterima";
        statusBadgeClass = "badge-success";
      } else if (rank <= quota + 2) {
        autoStatus = "Cadangan";
        statusBadgeClass = "badge-warning";
      } else {
        autoStatus = "Tidak Lolos";
        statusBadgeClass = "badge-danger";
      }

      // Final status (bisa dioverride pimpinan jika ada)
      const finalStatus = (manual && manual.status && manual.status !== 'Auto')
        ? manual.status
        : autoStatus;

      let finalBadgeClass = statusBadgeClass;
      if (finalStatus.includes("Lolos") || finalStatus === "Diterima") finalBadgeClass = "badge-success";
      else if (finalStatus.includes("Cadangan")) finalBadgeClass = "badge-warning";
      else finalBadgeClass = "badge-danger";

      return {
        rank,
        applicantId: item.applicantId,
        applicantName: item.applicantName,
        position: item.position,
        totalScore: item.totalScore,
        scoreFormatted: item.totalScore.toFixed(4),
        percentage: (item.totalScore * 100).toFixed(2) + "%",
        contributions: item.contributions,
        normalizedScores: item.normalizedScores,
        autoStatus,
        finalStatus,
        badgeClass: finalBadgeClass,
        notes: (manual && manual.notes) || (assessments[item.applicantId] && assessments[item.applicantId].notes) || "-"
      };
    });

    return {
      hasData: true,
      criteriaList: normalizedCriteria,
      rawTotalWeight,
      evaluatedApplicants,
      decisionMatrix,
      extremes,
      normalizedMatrix,
      weightedMatrix,
      rankings,
      quota
    };
  },

  /**
   * Menghasilkan penjelasan langkah matematis transparan untuk satu pelamar
   */
  generateApplicantExplanation(applicantId, calculationResult) {
    if (!calculationResult || !calculationResult.hasData) return null;

    const applicant = calculationResult.evaluatedApplicants.find(a => a.id === applicantId);
    if (!applicant) return null;

    const rankingInfo = calculationResult.rankings.find(r => r.applicantId === applicantId);
    const normInfo = calculationResult.normalizedMatrix.find(n => n.applicantId === applicantId);
    const rawScores = calculationResult.decisionMatrix.find(d => d.applicantId === applicantId).scores;

    const steps = calculationResult.criteriaList.map(c => {
      const raw = rawScores[c.code];
      const ext = calculationResult.extremes[c.code];
      const norm = normInfo.normalizedScores[c.code];
      const weight = c.normalizedWeight;
      const weighted = rankingInfo.contributions[c.code];

      return {
        criterion: c,
        raw,
        extremum: ext.targetExtremum,
        extremumType: ext.type === 'benefit' ? 'Max' : 'Min',
        normFormatted: norm.toFixed(4),
        weightFormatted: weight.toFixed(2),
        weightedFormatted: weighted.toFixed(4),
        formula: ext.type === 'benefit'
          ? `r_${c.code} = ${raw} / ${ext.max} = ${norm.toFixed(4)}`
          : `r_${c.code} = ${ext.min} / ${raw} = ${norm.toFixed(4)}`,
        weightedFormula: `${weight.toFixed(2)} × ${norm.toFixed(4)} = ${weighted.toFixed(4)}`
      };
    });

    return {
      applicant,
      rankingInfo,
      steps,
      totalScore: rankingInfo.totalScore.toFixed(4),
      percentage: rankingInfo.percentage
    };
  }
};
