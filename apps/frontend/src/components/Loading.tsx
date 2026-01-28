import loading from "../assets/images/Spinner_Loading.gif";

export default function Loading() {
  return (
    <div style={styles.container}>
      <img src={loading} alt="Loading..." style={styles.image} />
    </div>
  );
}

const styles = {
  container: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255,255,255,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  image: {
    width: 80,
    height: 80,
  },
};
