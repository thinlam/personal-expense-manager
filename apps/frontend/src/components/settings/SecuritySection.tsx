export default function SecuritySection() {
  return (
    <section className="settingsCard">
      <div className="sectionHead">
        <div className="sectionIcon">🛡️</div>
        <div>
          <h3>Bảo mật tài khoản</h3>
        </div>
      </div>

      <div className="formGrid">
        <div className="field">
          <label>MẬT KHẨU</label>
          <button className="btnPrimary" type="button">
            Đổi mật khẩu
          </button>
        </div>

        <div className="field">
          <label>XÁC THỰC 2 LỚP</label>
          <button className="btnGhost" type="button">
            Bật 2FA
          </button>
        </div>
      </div>
    </section>
  );
}