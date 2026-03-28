type Props = {
  name: string;
  email: string;
  plan: string;
};

export default function AccountSection({ name, email, plan }: Props) {
  return (
    <section className="settingsCard">
      <div className="sectionHead">
        <div className="sectionIcon">⚙️</div>
        <div>
          <h3>Thông tin tài khoản</h3>
        </div>
      </div>

      <div className="formGrid">
        <div className="field">
          <label>TÊN HIỂN THỊ</label>
          <div className="inputWrap">
            <input type="text" value={name} readOnly />
          </div>
        </div>

        <div className="field">
          <label>EMAIL</label>
          <div className="inputWrap">
            <input type="text" value={email} readOnly />
          </div>
        </div>

        <div className="field">
          <label>TRẠNG THÁI GÓI</label>
          <div className="inputWrap">
            <input type="text" value={plan} readOnly />
          </div>
        </div>
      </div>
    </section>
  );
}