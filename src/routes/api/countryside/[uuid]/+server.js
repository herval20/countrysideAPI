
import { createConnection } from "$lib/mysql.js"; // Import the MySQL connection setup
import { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } from '$env/static/private';

async function authenticate(request) {

const authHeader = request.headers.get('authorization');

if (!authHeader){
	return new Response(null,{
		status: 401,
		headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"'}
	});

}


const base64Credentials = authHeader.split(' ')[1];
const credentials = atob(base64Credentials);
const [username, password] = credentials.split(':');


if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD){
	return new Response (JSON.stringify({message:'Access denied'}), {
		status: 401,
		headers: {'Content-Type': 'application/json'},
	}); 
}
return null;

}



















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
	const auth = await authenticate(request);
	if (auth) return auth;

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

export async function DELETE({ params, request }) {
	const auth = await authenticate(request);
	if (auth) return auth;


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
