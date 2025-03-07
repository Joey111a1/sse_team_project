import logging
import azure.functions as func
from azure.functions import AsgiMiddleware

# Import your FastAPI app
from backend.app.main import app as fastapi_app

# Initialize the Azure Function App
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Create the ASGI middleware
asgi_middleware = AsgiMiddleware(fastapi_app)


# Define the HTTP trigger with a wildcard route
@app.route(route="{*route}", auth_level=func.AuthLevel.ANONYMOUS)
async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return await asgi_middleware.handle_async(req, context)
