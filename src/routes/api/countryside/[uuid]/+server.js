
import { createConnection } from "$lib/mysql.js"; // Import the MySQL connection setup

// The GET function is called when a GET request is made to the endpoint
export async function GET({ params }) {
    const { uuid } = params; // Change uuid to id since your primary key is 'id'
    
    try {
        const connection = await createConnection(); // Create a connection to the DB
        const [rows] = await connection.execute('SELECT * FROM countryside WHERE id = ?', [uuid]);
        
        if (rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Village not found' }), {
                status: 404,
                headers: { 'content-type': 'application/json' }
            });
        }

        // Return the countryside record as JSON
        return new Response(JSON.stringify(rows[0]), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Database connection failed' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
}


export async function PUT({ params, request }) {
	const connection = await createConnection();
    const { uuid } = params; 
    const data = await request.json();

        await connection.execute(
            `UPDATE countryside SET name = ?, description = ?, population = ? WHERE id = ?`,
            [data.name, data.description, data.population, uuid]
        );

		await connection.end();

       
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        });
}

export async function DELETE({ params }) {
    const { uuid } = params; 
    
    try {
        const connection = await createConnection(); 
        

        const [result] = await connection.execute('DELETE FROM countryside WHERE id = ?', [uuid]);

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Village not found' }), {
                status: 404,
                headers: { 'content-type': 'application/json' }
            });
        }

        return new Response(null, { status: 204 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Database connection failed' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
}
