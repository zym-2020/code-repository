from selenium import webdriver
from selenium.webdriver.common.by import By
import json

def execute(p1, p2):
    option = webdriver.EdgeOptions()
    # option.add_argument("headless")
    driver = webdriver.Edge(options=option)
    list1 = []
    list2 = []
    icon_map = {}
    for i in range(10):
        url = 'https://www.svgrepo.com/collections/all/' + str(i + 1)
        driver.get(url)
        element_list = driver.find_elements(By.XPATH, "//div[@class='style_Collection__pbtoU']/a")
        for element in element_list:
            list1.append(element.get_attribute('href'))
    for url in list1:
        driver.get(url)
        page = int(driver.find_element(By.XPATH, "//div[@class='style_pagingCarrier__NVbHL']/span").text.split()[-1])
        for i in range(1, page):
            driver.get(url + "/" + str(i + 1))
            element_list = driver.find_elements(By.XPATH, "//a[@itemtype='http://schema.org/ImageObject']")
            for element in element_list:
                list2.append(element.get_attribute('href') + "?edit=true")
        
    for url in list2:
        driver.get(url)
        element_list = driver.find_elements(By.XPATH, "//div[@class='style_editorLeft__DMhnF']/div[@class='undefined style_colorSelection__upHlk']/div[@class='style_prefItem__XVsLZ']")
        if str(len(element_list)) in icon_map:
            icon_map[str(len(element_list))] = icon_map[str(len(element_list))] + 1
        else:
            icon_map[str(len(element_list))] = 1
    driver.quit()
    file_path = "output.json"
    with open(file_path, 'w') as json_file:
        json.dump(icon_map, json_file)



execute('', '')
