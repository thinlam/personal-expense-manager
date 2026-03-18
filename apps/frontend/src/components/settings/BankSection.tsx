export default function BankSection() {
  return (
    <section className="settingsCard">
      <div className="sectionHead">
        <div className="sectionIcon">🏦</div>
        <div>
          <h3>Liên kết ngân hàng</h3>
        </div>
      </div>

      <div className="emptyStateBox">
        <p>Bạn chưa liên kết ngân hàng nào.</p>
        <button className="btnPrimary" type="button">
          Liên kết ngay
        </button>
      </div>
    </section>
  );
}