
import './App.css';
import CurrentLocation from "./Components/currentLocation";

function App() {
  return (
    <>  
    <div className="container">
    <CurrentLocation />
    </div>
    <div className='footer-info'>
    <a> Download Source Code</a>
    | Developed by{" "}
    <a target="_blank" href="">
          krishna Solanki
        </a>{" "}

    </div>
      </>
    
  );
}

export default App;

