from predict import Predictor

predictor = Predictor()
predictor.setup()  # 调用 setup 方法
result_path = predictor.predict(
    source_image="./input/tps_avatar.png",
    driving_video="./input/tps_driver_video.mp4",
    dataset_name="vox",
)
print(result_path)
