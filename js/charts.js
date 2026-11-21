/**
 * CHART ENGINE (PURE SVG & CANVAS)
 * Grafik interaktif visualisasi data pelamar & SPK SAW Toko Komputer BOSNIALine
 */

const ChartEngine = {
  /**
   * Render Donut Chart untuk Distribusi Posisi Pelamar
   */
  renderDonut(containerId, data, title = "") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      container.innerHTML = `<div class="chart-empty">Tidak ada data untuk ditampilkan</div>`;
      return;
    }

    const colors = [
      "#00e5ff", // neon cyan
      "#3b82f6", // royal blue
      "#10b981", // emerald green
      "#8b5cf6", // purple
      "#f59e0b", // amber
      "#ec4899"  // pink
    ];

    let cumulativeAngle = 0;
    const slices = data.map((item, i) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      // Hitung koordinat SVG Arc (Radius = 70, Inner = 45)
      const r = 70;
      const ir = 42;
      const cx = 100;
      const cy = 100;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const ix1 = cx + ir * Math.cos(endRad);
      const iy1 = cy + ir * Math.sin(endRad);
      const ix2 = cx + ir * Math.cos(startRad);
      const iy2 = cy + ir * Math.sin(startRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = `
        M ${x1} ${y1}
        A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${ir} ${ir} 0 ${largeArc} 0 ${ix2} ${iy2}
        Z
      `;

      return {
        path: pathData,
        color: colors[i % colors.length],
        label: item.label,
        value: item.value,
        percentage: ((item.value / total) * 100).toFixed(1)
      };
    });

    const pathsSvg = slices.map(s => `
      <path d="${s.path}" fill="${s.color}" class="donut-slice" data-tooltip="${s.label}: ${s.value} orang (${s.percentage}%)">
        <title>${s.label}: ${s.value} orang (${s.percentage}%)</title>
      </path>
    `).join('');

    const legendHtml = slices.map(s => `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${s.color};"></span>
        <span class="legend-label">${s.label}</span>
        <span class="legend-value">${s.value} (${s.percentage}%)</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="donut-chart-wrapper">
        <div class="svg-container">
          <svg viewBox="0 0 200 200" class="donut-svg">
            <g transform="rotate(0, 100, 100)">
              ${pathsSvg}
            </g>
            <circle cx="100" cy="100" r="38" fill="var(--bg-card)" />
            <text x="100" y="96" text-anchor="middle" class="donut-center-total">${total}</text>
            <text x="100" y="112" text-anchor="middle" class="donut-center-label">Pelamar</text>
          </svg>
        </div>
        <div class="chart-legend">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render Bar Chart Skor Ranking Nilai Preferensi (Vi) SAW
   */
  renderRankingsBar(containerId, rankings) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!rankings || rankings.length === 0) {
      container.innerHTML = `<div class="chart-empty">Belum ada hasil ranking untuk divisualisasikan</div>`;
      return;
    }

    const topRankings = rankings.slice(0, 6); // Ambil top 6
    const barsHtml = topRankings.map((item, idx) => {
      const percentage = (item.totalScore * 100).toFixed(1);
      const isTop = idx === 0;
      const isAccepted = item.finalStatus.includes("Lolos") || item.finalStatus.includes("Diterima");

      let barColor = isAccepted ? "linear-gradient(90deg, #00e5ff, #3b82f6)" : "linear-gradient(90deg, #64748b, #94a3b8)";
      if (idx === 0) barColor = "linear-gradient(90deg, #10b981, #00e5ff)";

      return `
        <div class="bar-chart-row">
          <div class="bar-info">
            <span class="bar-rank-badge ${isAccepted ? 'rank-gold' : 'rank-gray'}">#${item.rank}</span>
            <span class="bar-name">${item.applicantName}</span>
            <span class="bar-position">${item.position.split('&')[0]}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${percentage}%; background: ${barColor};" data-score="${item.scoreFormatted}">
              <span class="bar-score-label">${item.scoreFormatted} (${percentage}%)</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bar-chart-wrapper">
        ${barsHtml}
      </div>
    `;
  }
};
