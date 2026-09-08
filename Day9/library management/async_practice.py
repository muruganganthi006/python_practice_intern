import asyncio


async def download_data():
    print("Downloading...")

    await asyncio.sleep(2)

    print("Download completed!")


asyncio.run(download_data())