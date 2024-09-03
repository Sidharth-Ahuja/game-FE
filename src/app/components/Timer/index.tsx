import ImagesComp from "../ImagesComp";
import RealTimeCounter from "../RealTimeCounter";

const Timer = () => {
  
  return (
    <div>
      <div style={{position: "absolute",top: "16px", right: "16px"}}><RealTimeCounter /></div>
      <ImagesComp /> 
    </div>
  );
};

export default Timer;
