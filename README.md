# Graphs-For-Algorithms

![Graph Visualization](https://i.imgur.com/WxVJGnE.png)

Welcome to **Graphs-For-Algorithms**! This project provides an interactive platform for visualizing various graph algorithms, making it easier to understand complex concepts through visual aids.
Start now: https://renanbazinin.github.io/Graphs-For-Algorithms/
## 🚀 Features

- **Graph Creation:** Easily create and customize both directed and undirected graphs.
- **Algorithm Visualization:** Step-by-step visualization of algorithms like Topological Sort, Breadth-First Search (BFS), Depth-First Search (DFS), and more.
- **Touch Interaction:** Fully interactive graph manipulation with touch support for mobile devices.
- **Dynamic Graph Import:** Import graphs dynamically using adjacency lists in a user-friendly modal interface.
- **Responsive Design:** Optimized for both desktop and mobile views, ensuring a seamless experience on any device.

## 📸 Screenshots

### In-App View
![In-App View](https://i.imgur.com/x9pgo3f.png)

### Example of Graph Manipulation
![Graph Manipulation](https://i.imgur.com/GUzC59L.png)

### Import Graph Feature
![Import Graph](https://i.imgur.com/cWHnzNf.png)

## 🛠️ Setup & Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/renanbazinin/Graphs-For-Algorithms.git
    cd Graphs-For-Algorithms
    ```

2. **Open the `index.html` file in your browser:**

    ```bash
    open index.html
    ```

    Or simply drag and drop the `index.html` file into your browser.

3. **Start Visualizing:**

   Begin by exploring the graph visualization and interact with the algorithms provided.

## 📂 Project Structure


## 🔮 How to Use

### Creating and Manipulating Graphs

1. **Add Nodes & Edges:**
   - Use the provided interface to add nodes and edges dynamically.
   - Drag and drop nodes to reposition them as needed.

2. **Visualizing Algorithms:**
   - Navigate to `things.html` to explore the Topological Sort visualizer.
   - Step through the algorithm with visual feedback on the graph.

3. **Importing Graphs:**
   - Use the "Import Graph" feature to input an adjacency list and visualize it instantly.
   - **How to Import a Graph:**
     1. Click on the "Import Graph" button to open the modal.
     2. In the text area, input your adjacency list using the format: `Node -> Neighbor1, Neighbor2`.
     3. Click "Load Graph" to visualize your graph.
     4. Example:
        ```
        גרביים -> נעליים
        תחתונים -> מכנסיים
        מכנסיים -> נעליים, חגורה
        חולצה -> עניבה, חגורה
        עניבה -> מעיל
        חגורה -> מעיל
        שעון -> חגורה
        ```

### Loading Graphs from URL

   You can also load graphs from a URL containing a JSON file. The JSON should follow this format:

   ```json
   {
   "nodes": [
      {"name": "Node1", "x": 100, "y": 100},
      {"name": "Node2", "x": 200, "y": 200}
   ],
   "edges": [
      {"from": "Node1", "to": "Node2"}
   ]
   }
### Customizing the Experience

- Modify `styles.css` to tweak the appearance.
- Extend the functionality by adding more algorithms in JavaScript.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. **Fork the repository**
2. **Create a new branch**
3. **Make your changes**
4. **Submit a pull request**

## 🌟 Acknowledgements

Special thanks to all my mentors and to my MTA. :-)

---

_Enjoyed this project? Give it a ⭐ on [GitHub](https://github.com/renanbazinin/Graphs-For-Algorithms)!_
