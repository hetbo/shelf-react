import Greet from "./components/Greet";

const App = () => {

  const name = "Hosein";

  const multiply = (a, b) => a * b;

  const buttonClasses = "bg-teal-500 rounded text-white px-4 py-2 shadow hover:shadow-lg cursor-pointer";

  return <section>
    <p>2 * 7 = {multiply(2, 7)}</p>
    <p>{name.length}</p>
    <button className={buttonClasses}>Submit</button>
    </section>
}

export default App; 