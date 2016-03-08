from app import create_app

# run as __main__
if __name__ == '__main__':
  app = create_app()
  app.run(debug=True,host='0.0.0.0',port=8081)
